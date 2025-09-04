
const dbServices = {};

dbServices.find = async (model, query) => {
    return model.find(query);
}

dbServices.insert = async (model, data) => {
  return model.create(data);
}

module.exports = dbServices;