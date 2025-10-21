const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};


// When I have done the query for inserting the atricles, I will add returning * to that query and that will give me access to the result in the next then block. 
