
// Education Hub Nepal - Student Question Paper Library

let selectedClass = "All";
let papers = [];

async function loadPapers() {
  const list = document.getElementById("paperList");

  if (!window.supabaseClient) {
    list.textContent = "Supabase connection is not configured yet.";
    return;
  }

  list.textContent = "Loading question papers...";

  const { data, error } = await window.supabaseClient
    .from("question_papers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = "Unable to load papers: " + error.message;
    return;
  }

  papers = data || [];
  displayPapers();
}

function selectClass(className) {
  selectedClass = className;

  document.getElementById("paperHeading").textContent =
    className === "All"
      ? "Available Question Papers"
      : className + " Question Papers";

  displayPapers();
}

function displayPapers() {
  const list = document.getElementById("paperList");
  const search = document.getElementById("searchInput")
    .value.toLowerCase().trim();

  const filtered = papers.filter(p => {
    const matchesClass =
      selectedClass === "All" || p.class_name === selectedClass;

    const matchesSearch =
      (p.title + " " + p.subject + " " + p.year)
        .toLowerCase().includes(search);

    return matchesClass && matchesSearch;
  });

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.textContent = "No question papers available yet.";
    return;
  }

  filtered.forEach(p => {
    const { data } = window.supabaseClient.storage
      .from("Question paper of health BLE")
      .getPublicUrl(p.file_path);

    const card = document.createElement("div");
    card.className = "paper-card";

    const title = document.createElement("h3");
    title.textContent = p.title;

    const classText = document.createElement("p");
    classText.textContent = "Class: " + p.class_name;

    const subjectText = document.createElement("p");
    subjectText.textContent = "Subject: " + p.subject;

    const yearText = document.createElement("p");
    yearText.textContent = "Year: " + p.year;

    const viewLink = document.createElement("a");
    viewLink.href = data.publicUrl;
    viewLink.target = "_blank";
    viewLink.rel = "noopener";
    viewLink.textContent = "View PDF";

    const downloadLink = document.createElement("a");
    downloadLink.href = data.publicUrl;
    downloadLink.download = "";
    downloadLink.textContent = "Download PDF";

    card.append(
      title,
      classText,
      subjectText,
      yearText,
      viewLink,
      document.createTextNode(" | "),
      downloadLink
    );

    list.appendChild(card);
  });
}

document.getElementById("searchInput")
  .addEventListener("input", displayPapers);

// Load papers when the homepage opens
loadPapers();
