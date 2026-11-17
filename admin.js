
window.handleLogin = async function(event) {
  event.preventDefault();

  const message = document.getElementById("message");
  const button = document.getElementById("loginButton");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  button.disabled = true;
  message.textContent = "Connecting to Supabase...";
  message.style.color = "blue";

  try {
    if (!window.supabaseClient) {
      throw new Error(
        "Supabase client missing. Check supabase.js and script order."
      );
    }

    const { error } =
      await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      message.textContent =
        "Incorrect email or password. Please check your details.";
      message.style.color = "red";
      return;
    }

    message.textContent = "Login successful!";
message.style.color = "green";

window.location.href = "dashboard.html";

  } catch (err) {
    message.textContent = "Error: " + err.message;
    message.style.color = "red";

  } finally {
    button.disabled = false;
  }
};

window.sendPasswordReset = async function() {
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message");

  if (!email) {
    message.textContent = "Enter your admin email first.";
    return;
  }

  const { error } =
    await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: "http://127.0.0.1:5500/reset-password.html"
    });

  message.textContent = error
    ? error.message
    : "Password recovery email sent. Check your inbox.";
};
