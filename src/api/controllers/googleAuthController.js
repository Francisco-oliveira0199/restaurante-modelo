export function loginGoogle(
  req,
  res
) {

  res.redirect(
    "/auth/google"
  );

}

export function callbackGoogle(
  req,
  res
) {

  try {

    const token =
      req.user.token;

    res.redirect(
      `http://localhost:5500/index.html?token=${token}`
    );

  } catch {

    res.redirect(
      "http://localhost:5500/login.html"
    );

  }

}