let db;
// create a new db request for a "budget" database.
const request =indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};


request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  
  request.onerror = function (event) {
      console.log(event.data.error)
  
    };
  
    function saveRecord(record) {
      // create a transaction on the pending db with readwrite access
      const transaction = db.transaction(["pending"], "readwrite");
      // access pending object store
      const pendingStore = transaction.objectStore("pending");
      // add record to store with add method.
      pendingStore.add({ name: record.name, value: record.value, date: record.date });
    }
    
    function checkDatabase() {
      // open a transaction on pending db
      const transaction = db.transaction(["pending"], "readwrite");
      // access pending object store
      const pendingStore = transaction.objectStore("pending");
      // get all records from store and set to a variable
      const getAll = pendingStore.getAll();
    
    
      getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then(() => {
              // if successful, open a transaction on pending db
              const transaction = db.transaction(["pending"], "readwrite");
              // access pending object store
              const pendingStore = transaction.objectStore("pending");
              // clear all items in your store
              pendingStore.clear();
            });
        }
      };
    }
    
    // listen for app coming back online
    window.addEventListener('online', checkDatabase);