export const userDisplayName = ({ customName, name, customEmail, email, id }) => customName || name || customEmail || email || `#${id}`;
