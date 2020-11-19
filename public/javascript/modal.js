let enter = document.getElementById("site-entry");

let modalHandler = function () {
  localStorage.setItem("entry-confirmed", JSON.stringify(true));

  $("#exampleModalCenter").modal("hide");
};

enter.addEventListener("click", modalHandler);
