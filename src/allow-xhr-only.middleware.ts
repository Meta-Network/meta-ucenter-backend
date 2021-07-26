import { NotAcceptableException } from '@nestjs/common';

export function allowXhrOnlyMiddleware(req, res, next) {
  if (req.header('content-type') === 'application/x-www-form-urlencoded') {
    throw new NotAcceptableException('Only accept AJAX request, no form post.');
  }
  next();
}
