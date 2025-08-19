import { Request, Response } from "express";

import getSafeRedirect from "../../utils/helpers/auth/getSafeRedirect";

//Redirect after google signin
const googleSignInRedirect = (req: Request, res: Response) => {
  //Page redirect
  const pageRedirect = getSafeRedirect(req.body?.pageRedirect);

  //Redirect on client-side
  res.redirect(pageRedirect);
};

export default googleSignInRedirect;
