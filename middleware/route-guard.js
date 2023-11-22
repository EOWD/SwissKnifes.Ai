const isLoggedIn = (req, res, next) => {
    if (!req.session.currentUser) {
      return res.redirect('/auth/login');
    }
    next();
  };
  const isLoggedOut = (req, res, next) => {
    if (req.session.currentUser) {
      return res.redirect('/');
    }
    next();
  };
   
  const loadingMiddleware = (req, res, next) => {
   
    res.locals.isLoading = true;

    setTimeout(() => {
        res.locals.isLoading = false;

        next();
    }, 2000); 
};
  module.exports = {
    isLoggedIn,
    isLoggedOut,
    loadingMiddleware,
  };