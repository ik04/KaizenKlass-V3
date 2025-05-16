export const convertLinksToAnchors = (text: string, currentDomain: string) => {
  const boldPattern = /\*\*(.*?)\*\*/g;
  text = text.replace(boldPattern, "<strong>$1</strong>");

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const currentBaseDomain = new URL(currentDomain).hostname.split(".")[0];

  return text.replace(urlRegex, (url) => {
    try {
      const parsedUrl = new URL(url);
      const baseDomain = parsedUrl.hostname.split(".")[0];

      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      console.log(baseDomain, currentBaseDomain);

      if (baseDomain === currentBaseDomain) {
        if (pathSegments[0] === "assignments" && pathSegments[1]) {
          const uuid = pathSegments[1];
          return `<a href="${currentDomain}/assignments/${uuid}" style="color: #D5CEA3; cursor: pointer; font-weight: bold;">Visit Assignment -></a>`;
        } else if (pathSegments[0] === "tests" && pathSegments[1]) {
          const uuid = pathSegments[1];
          return `<a href="${currentDomain}/tests/${uuid}" style="color: #D5CEA3; cursor: pointer; font-weight: bold;">Visit Test -></a>`;
        } else {
          return `<a href="${url}" style="color: #D5CEA3; cursor: pointer; font-weight: bold;">Visit Source -></a>`;
        }
      } else {
        return `<a href="${url}" style="color: #3A84CE; cursor: pointer;" target="_blank">${url}</a>`;
      }
    } catch (error) {
      return url;
    }
  });
};
