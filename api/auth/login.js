import { signToken, validateCredentials } from '../_lib/auth.js';
import { allowMethods, handleApiError, readJsonBody, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email, password } = await readJsonBody(req);
    const user = validateCredentials(email, password);

    sendJson(res, 200, {
      token: signToken(user),
      user,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
