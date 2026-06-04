# AMS App Notifications

This context manages notification data for AMS App consumers and the profile rows those consumers are attached to. It exists to separate profile-scoped notification state from consumer-scoped registration state.

## Language

### Notification Model

**Profile**:
A notification profile identified by a single profileId. A Profile can have many Consumer Details and owns the notification content and profile-scoped metadata.
_Avoid_: Consumer, user row, registration row

**Consumer Detail**:
A consumer-specific registration record identified by a globally unique consumerId. A Consumer Detail belongs to exactly one Profile and stores consumer-scoped expiry data. In the `consumerDetails` API payload, this identifier is exposed as `id`.
_Avoid_: ConsumerId entry, login session, profile link

**Consumer Profile Lookup**:
The read model returned for a specific consumerId. It may include profile-scoped fields and also includes the consumer-specific Login Expiry Date.
_Avoid_: Profile-only lookup, expiry-blind registration check

**Consumer Details**:
The preferred batch-response collection of Consumer Detail projections for a Profile. `consumerIds` remains only as a legacy compatibility alias and reflects the same returned consumers as `consumerDetails`.
_Avoid_: Consumers, consumerIds

**Consumer**:
The external app user represented by a globally unique consumerId. A Consumer references exactly one Profile at a time.
_Avoid_: Profile, account, registration batch item

**Last Login Date**:
Profile-scoped metadata that belongs to the Profile, not to any individual Consumer. It remains separate from consumer expiry data.
_Avoid_: Consumer expiry, registration expiry

**Login Expiry Date**:
Consumer-scoped expiry metadata stored on the Consumer Detail. It is set when a Consumer registers and is reset to three calendar months from the registration time on each successful re-registration.
_Avoid_: Session expiry, token expiry, last login date

**Active Consumer Detail**:
A Consumer Detail whose Login Expiry Date is after the current time. Cronjob cleanup treats non-active Consumer Details as expired and removes them.
_Avoid_: Expired consumer, stale registration

**Visible Profile**:
A Profile returned by Fetch Notifications. Today this means a Profile with at least one linked Consumer Detail; read-time filtering on Login Expiry Date is not applied in the fetch endpoint itself.
_Avoid_: Empty profile row

**Visible Pagination**:
Fetch Notifications pagination and totalItems are calculated from Profiles that have at least one linked Consumer Detail and match `dateFrom` when provided.
_Avoid_: Raw-row pagination

**Cronjob Cleanup**:
The cronjob first removes expired Consumer Details and immediately removes any Profiles that no longer have Consumer Details. Only after cleanup does it fetch and store notifications for the remaining Profiles.
_Avoid_: Refresh-before-cleanup

**Logout Notification**:
The APP server webhook call made only for cronjob-driven Consumer Detail removal. The payload is a single object with a batched `device_ids` array equal to `consumerIds`, and delivery is best-effort.
_Avoid_: Device logout, token revocation callback

**Unregister Consumer**:
The shared invalidation function used by explicit removal paths and cronjob cleanup. It always removes the Consumer Detail and any newly orphaned Profile, and callers control cronjob-only webhook behavior through a boolean parameter or config object such as `triggerAmsAppUnregisterConsumerWebhook`.
_Avoid_: Cron-only delete, route-only delete

**Registration**:
The authoritative act that attaches a Consumer to a Profile and refreshes that Consumer's Login Expiry Date. If the same consumerId registers with a different Profile, the Consumer Detail moves to the new Profile.
_Avoid_: Login refresh, background sync

**Service IDs**:
Profile-scoped service configuration attached to a Profile. On Registration, the Profile's Service IDs are replaced by the new Service IDs payload.
_Avoid_: Consumer services, merged entitlements

**Model Shape**:
Profile persistence and Consumer Detail persistence use separate tables, but are currently implemented in the same model module.
_Avoid_: Assuming module-level separation

## Flagged Ambiguities

- `loginExpiryDate` sounds like session or token expiry, but in this context it means consumer registration expiry.
- Consumer validity is determined by `now < loginExpiryDate`.
- `id` inside `consumerDetails` means consumerId, not profileId.

## Example Dialogue

Dev: If one person registers the app twice, do we create two consumers?
Domain expert: No. The Consumer is identified by a globally unique consumerId, so we update the existing Consumer Detail.

Dev: What if that consumer now belongs to a different Profile?
Domain expert: Registration is authoritative, so we move the Consumer Detail to the new Profile and remove the old Profile if it no longer has any consumers.

Dev: Do we merge the new services with the old services on that Profile?
Domain expert: No. Registration replaces the Profile's Service IDs with the new set.

Dev: Which consumers are returned by Fetch Notifications?
Domain expert: The endpoint returns linked Consumer Details from storage. Expired consumers are primarily removed by cronjob cleanup rather than read-time filtering.

Dev: What if a Profile has no active consumers left after that filtering?
Domain expert: There is no read-time active filtering today. A Profile is omitted when it has no linked Consumer Details.

Dev: What do offset, limit, and totalItems refer to?
Domain expert: They refer to Profiles with at least one linked Consumer Detail (and matching `dateFrom` when provided), not to all raw stored rows.

Dev: Which field should callers move to?
Domain expert: `consumerDetails` is the preferred field. `consumerIds` only remains for backward compatibility and contains the same returned consumers as a thin projection.

Dev: In what order does the cronjob work?
Domain expert: First it removes expired Consumer Details and orphaned Profiles, then it refreshes notifications for the remaining Profiles.

Dev: What do invalidation paths send to the APP server?
Domain expert: All invalidation paths use unregisterConsumer, but only cronjob removal enables `triggerAmsAppUnregisterConsumerWebhook` and calls the logout-notification webhook with a single object containing batched device_ids (consumerIds). The Consumer is still removed even if that webhook fails.

Dev: Do those two concerns still share one model layer?
Domain expert: Yes. They use separate tables but currently live in the same model module.
