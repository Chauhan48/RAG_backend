const userModel = require("../modals/userModal");
const common = require("../utils/common");

const authMiddleware = async (req, res, next) => {
    try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).render('unauthorized');
    }
    const decoded = common.decryptToken(token);
    const userId = common.convertToMongoDbObjectId(decoded.userId);
    const userData = await userModel.findOne({ _id: userId });
    req.user = userData;
    
    next();
  } catch (err) {
    return res.status(401).render('unauthorized');
  }
};

module.exports = authMiddleware;