declare global {
  namespace Express {
    interface Request {
      searchFilters?: any;
    }
  }
}
