import { Request, Response } from "express";

import getSafeRedirect from "../../utils/helpers/auth/getSafeRedirect";

//Redirect after google signin
const googleSignInRedirect = (req: Request, res: Response) => {
  //Destructure client URL from req body
  const { clientUrl, pageRedirect: redirect } = req.body;

  //Page redirect
  const pageRedirect = getSafeRedirect(redirect);

  console.log(clientUrl, redirect, pageRedirect);

  //Redirect on client-side
  res.redirect(`${clientUrl}${pageRedirect}`);
};

export default googleSignInRedirect;
