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
The preferred batch-response collection of Consumer Detail projections for a Profile. `consumerIds` remains only as a legacy compatibility alias and reflects the same active visible consumers.
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
A Consumer Detail whose Login Expiry Date is after the current time. Fetch Notifications and other read paths only include active Consumer Details and exclude expired ones from the response.
_Avoid_: Expired consumer, stale registration

**Visible Profile**:
A Profile returned by Fetch Notifications after read-time filtering. A Visible Profile must still have at least one active Consumer Detail.
_Avoid_: Empty profile row, inactive profile response

**Visible Pagination**:
Fetch Notifications pagination and totalItems are calculated from Visible Profiles, not from raw stored Profile rows.
_Avoid_: Raw-row pagination, pre-filter totals

**Cronjob Cleanup**:
The cronjob first removes expired Consumer Details and immediately removes any Profiles that no longer have Consumer Details. Only after cleanup does it fetch and store notifications for the remaining Profiles.
_Avoid_: Refresh-before-cleanup

**Logout Notification**:
The APP server webhook call made only for cronjob-driven Consumer Detail removal. The payload is a single object with a batched `consumer_ids` array, and delivery is best-effort.
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

**Model Split**:
Profile persistence and Consumer Detail persistence live in separate model modules. The service layer may orchestrate both, but profile tables and queries stay separate from consumer-detail tables and queries.
_Avoid_: Shared persistence blob, mixed model file

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
Domain expert: Only active Consumer Details, meaning the current time is still before their loginExpiryDate. Read paths exclude expired consumers instead of removing them immediately.

Dev: What if a Profile has no active consumers left after that filtering?
Domain expert: Then it is omitted from the Fetch Notifications response.

Dev: What do offset, limit, and totalItems refer to?
Domain expert: They refer to the visible filtered profiles, not to raw stored profile rows.

Dev: Why does the payload use `id` instead of `consumerId`?
Domain expert: Inside `consumerDetails`, `id` is the consumer identifier by definition.

Dev: Which field should callers move to?
Domain expert: `consumerDetails` is the preferred field. `consumerIds` only remains for backward compatibility and contains the same active visible consumers as a thin projection.

Dev: Does the single-consumer lookup also return loginExpiryDate?
Domain expert: Yes. The consumer profile lookup can return the consumer-specific loginExpiryDate alongside the profile data.

Dev: In what order does the cronjob work?
Domain expert: First it removes expired Consumer Details and orphaned Profiles, then it refreshes notifications for the remaining Profiles.

Dev: What do invalidation paths send to the APP server?
Domain expert: All invalidation paths use unregisterConsumer, but only cronjob removal enables `triggerAmsAppUnregisterConsumerWebhook` and calls the logout-notification webhook with a single object containing batched consumer_ids. The Consumer is still removed even if that webhook fails.

Dev: Where do the notifications live then?
Domain expert: On the Profile. The Consumer Detail only points at the Profile and stores its own loginExpiryDate.

Dev: Do those two concerns still share one model layer?
Domain expert: No. Profile queries and Consumer Detail queries are split into separate model modules.

Dev: Can a Profile exist without any consumers?
Domain expert: No. When the last Consumer Detail is removed, the Profile is removed immediately as well.
