const RESP_SENT_FLAG = Symbol.for("res.sent");

export const success = (res, data = null, message = "Success", status = 200) => {
  if (res.headersSent || res.locals[RESP_SENT_FLAG]) return;
  res.locals[RESP_SENT_FLAG] = true;
 if(!data)  return res.status(status).json({ success: true, message });
 else  return res.status(status).json({ success: true, message, data });
};

export const error = (res, message = "Error", code = 500) => {
  if (res.headersSent || res.locals[RESP_SENT_FLAG]) return;
  res.locals[RESP_SENT_FLAG] = true;
  return res.status(code).json({ success: false, message });
};
