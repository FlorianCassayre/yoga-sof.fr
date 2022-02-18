export const replyMethodNotAllowed = res => {
  res.status(405).json({ error: 'Method Not Allowed' });
};

export const replyUnauthorized = res => {
  res.status(401).json({ error: 'Unauthorized' });
};

export const replyForbidden = res => {
  res.status(403).json({ error: 'Forbidden' });
};
