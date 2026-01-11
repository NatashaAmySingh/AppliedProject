
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
	const auth = req.headers && req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing authorization header' });
	const token = auth.slice(7);
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { user_id: payload.id || payload.user_id, role: payload.role || payload.role_id };
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' });
	}
};

exports.requireRole = (allowed = []) => (req, res, next) => {
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
	const role = Number(req.user.role);
	const allowedArr = Array.isArray(allowed) ? allowed.map(Number) : [Number(allowed)];
	if (allowedArr.length > 0 && !allowedArr.includes(role)) return res.status(403).json({ error: 'Forbidden' });
	next();
};
