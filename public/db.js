const request = window.indexedDB.open("budget", 1);
let db;

request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = (err) => {
    console.log("Error: "+ err.target.errorCode);
}

request.onsuccess = (e) => {
    db = e.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
}

function saveRecord(rec) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(rec);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }  
            }).then(response => response.json()).then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}   
window.addEventListener("online", checkDatabase);