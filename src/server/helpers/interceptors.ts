export async function interceptRequestMultipleUrls(response: any) {
  let interceptedResponse = { ...response };
  if (
    response.config?.nextUrls &&
    response.config?.url &&
    !response.config?.nextUrls.includes(response.config.url)
  ) {
    interceptedResponse.headers[
      'link'
    ] = `<${response.config.url}/>; rel="self",<${response.config.nextUrls[0]}>; rel="next",`;
  } else {
    const indexNextUrl = response.config.nextUrls?.findIndex(
      (url: string) => url === response.config.url
    );

    if (indexNextUrl > -1) {
      interceptedResponse.headers[
        'link'
      ] = `<${response.config.link}/>; rel="self",<${response.config.nextUrls[indexNextUrl]}>; rel="next",`;
    }
  }

  return interceptedResponse;
}
