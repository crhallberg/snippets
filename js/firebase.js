class Firebase {
  constructor(databaseURL, apiKey) {
    this.getQueue = [];
    this.setQueue = [];
    this.listenQueue = [];
    if (typeof databaseURL !== "undefined") {
      this.databaseUrl = databaseURL;
    }
    if (typeof apiKey !== "undefined") {
      initialize(apiKey);
    }
  }

  initialize(apiKey) {
    firebase.initializeApp({ databaseURL: this.databaseUrl, apiKey });
    this.ref = firebase.database().ref(this.databaseUrl);
    // Handle pre-initialized queue
    this.getQueue.forEach(s => this.get(s.key, s.func));
    this.setQueue.forEach(s => this.set(s.key, s.data));
    this.listenQueue.forEach(s => this.listen(s.key, s.func));
    delete this.getQueue;
    delete this.setQueue;
    delete this.listenQueue;
  }

  static loadFromConfig(path) {
    const conn = new Firebase();
    fetch(path)
      .then(response => response.json())
      .then(
        function connectionInit(CONFIG) {
          conn.databaseUrl = CONFIG.databaseUrl;
          conn.initialize(CONFIG.apiKey);
        }
      );
    return conn;
  }

  get(key, func) {
    if (typeof this.ref === "undefined") {
      this.getQueue.push({ key, func });
    } else {
      this.ref
        .child(key)
        .once("value")
        .then(data => func(data.val()));
    }
  }

  set(key, data) {
    if (typeof this.ref === "undefined") {
      this.setQueue.push({ key, data });
    } else {
      this.ref.child(key).set(data);
    }
  }

  listen(key, func) {
    if (typeof this.ref === "undefined") {
      this.listenQueue.push({ key, func });
    } else {
      this.get(key, function listenGet(r) {
        if (r.key === key) {
          func(r.val());
        }
      });
      this.ref.on("child_changed", function listenChange(r) {
        if (r.key === key) {
          func(r.val());
        }
      });
    }
  }
}
