function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erreur interne du serveur.',
  });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.originalUrl} introuvable.` });
}

module.exports = { errorHandler, notFound };
