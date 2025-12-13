import { Request, Response } from "express";

import getSafeRedirect from "../../utils/helpers/auth/getSafeRedirect";

//Redirect after google signin
const googleSignInRedirect = (req: Request, res: Response) => {
  //Client URL
  const clientUrl = req.headers.origin || req.headers.referer;

  //Page redirect
  const pageRedirect = getSafeRedirect(req.body?.pageRedirect);

  //Redirect on client-side
  res.redirect(`${clientUrl}${pageRedirect}`);
};

export default googleSignInRedirect;
