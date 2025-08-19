//Validate redirect paths
export default function getSafeRedirect(redirect: string | undefined): string {
  if (!redirect) return "/"; //Fallback to home

  //Allow only relative paths that start with "/" but not "//"
  if (redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }

  return "/";
}
