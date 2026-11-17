
// Education Hub Nepal - Admin Dashboard

const client = window.supabaseClient;
const BUCKET_NAME = "Question paper of health BLE";

const uploadForm = document.getElementById("uploadForm");
const message = document.getElementById("message");
const adminPaperList = document.getElementById("adminPaperList");
const logoutButton = document.getElementById("logoutButton");

// Check whether admin is logged in
async function checkAdmin() {
  const { data, error } = await client.auth.getSession();

  if (error || !data.session) {
    window.location.href = "admin.html";
    return;
  }

  message.textContent = "Admin login verified.";
  await loadAdminPapers();
}

// Load uploaded question papers
async function loadAdminPapers() {
  if (!adminPaperList) return;

  adminPaperList.textContent = "Loading question papers...";

  const { data: papers, error } = await client
    .from("question_papers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    adminPaperList.textContent =
      "Error loading papers: " + error.message;
    return;
  }

  adminPaperList.replaceChildren();

  if (!papers || papers.length === 0) {
    adminPaperList.textContent = "No question papers uploaded yet.";
    return;
  }

  papers.forEach((paper) => {
    const item = document.createElement("div");
    item.style.border = "1px solid #ccc";
    item.style.padding = "12px";
    item.style.marginBottom = "12px";
    item.style.borderRadius = "8px";

    const title = document.createElement("h3");
    title.textContent = paper.title;

    const details = document.createElement("p");
    details.textContent =
      paper.class_name + " | " +
      paper.subject + " | " +
      paper.year;

    const viewLink = document.createElement("a");
    const { data: fileData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(paper.file_path);

    viewLink.href = fileData.publicUrl;
    viewLink.target = "_blank";
    viewLink.rel = "noopener noreferrer";
    viewLink.textContent = "View PDF";
    viewLink.style.marginRight = "15px";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.backgroundColor = "#d93025";
    deleteButton.style.color = "white";

    deleteButton.addEventListener("click", () => {
      deletePaper(paper, deleteButton);
    });

    item.append(title, details, viewLink, deleteButton);
    adminPaperList.appendChild(item);
  });
}

// Delete a question paper
async function deletePaper(paper, button) {
  const confirmed = confirm(
    'Are you sure you want to delete "' +
    paper.title +
    '"?'
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Deleting...";

  // First delete the PDF from Storage
  const { error: storageError } = await client.storage
    .from(BUCKET_NAME)
    .remove([paper.file_path]);

  if (storageError) {
    alert("PDF deletion failed: " + storageError.message);
    button.disabled = false;
    button.textContent = "Delete";
    return;
  }

  // Then delete its database record
  const { error: databaseError } = await client
    .from("question_papers")
    .delete()
    .eq("id", paper.id);

  if (databaseError) {
    alert(
      "PDF was removed, but its database record could not be deleted: " +
      databaseError.message
    );
    await loadAdminPapers();
    return;
  }

  message.textContent = "Question paper deleted successfully.";
  await loadAdminPapers();
}

// Upload a new question paper
uploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const className = document.getElementById("className").value;
  const subject = document.getElementById("subject").value.trim();
  const year = document.getElementById("year").value.trim();
  const file = document.getElementById("pdfFile").files[0];
  const uploadButton = document.getElementById("uploadButton");

  if (!file || file.type !== "application/pdf") {
    message.textContent = "Please select a valid PDF file.";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    message.textContent = "PDF must be smaller than 10 MB.";
    return;
  }

  uploadButton.disabled = true;
  uploadButton.textContent = "Uploading...";
  message.textContent = "Please wait. Uploading your PDF...";

  const fileName = crypto.randomUUID() + ".pdf";
  const folderName = className.replaceAll(" ", "-");
  const filePath = folderName + "/" + fileName;

  // Upload PDF to Supabase Storage
  const { error: uploadError } = await client.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: false
    });

  if (uploadError) {
    message.textContent = "Upload failed: " + uploadError.message;
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload Question Paper";
    return;
  }

  // Save paper details in the database
  const { error: databaseError } = await client
    .from("question_papers")
    .insert([{
      title: title,
      class_name: className,
      subject: subject,
      year: year,
      file_path: filePath
    }]);

  if (databaseError) {
    await client.storage.from(BUCKET_NAME).remove([filePath]);
    message.textContent =
      "Database error: " + databaseError.message;
  } else {
    message.textContent = "Question paper uploaded successfully!";
    uploadForm.reset();
    await loadAdminPapers();
  }

  uploadButton.disabled = false;
  uploadButton.textContent = "Upload Question Paper";
});

// Admin logout
logoutButton.addEventListener("click", async function () {
  const { error } = await client.auth.signOut();

  if (error) {
    message.textContent = "Logout failed: " + error.message;
    return;
  }

  window.location.href = "admin.html";
});

// Start dashboard
checkAdmin();
