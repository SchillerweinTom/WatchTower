require("dotenv").config();
const ldap = require("ldapjs");

function authenticate(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: process.env.LDAP_SERVER_URL,
    });

    console.log("Connecting to LDAP server:", process.env.LDAP_SERVER_URL);

    //Bind user
    client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
      if (err) {
        console.error("LDAP bind failed:", err);
        client.unbind();
        return reject("LDAP bind failed");
      }

      console.log("Successfully bound to LDAP as service account.");

      //Search user
      const searchOptions = {
        filter: `(sAMAccountName=${username})`,
        scope: "sub",
        attributes: ["dn", "cn", "memberOf"],
      };

      client.search(process.env.BASE_DN, searchOptions, (err, res) => {
        if (err) {
          console.error("LDAP search error:", err);
          client.unbind();
          return reject("LDAP search failed");
        }

        let userDN = null;
        let userGroups = [];

        res.on("searchEntry", (entry) => {
            if (!entry) {
                console.error("LDAP entry.object is undefined!");
                return;
            }
            userDN = entry.dn.toString();
            console.log("User DN found:", userDN);

            if (entry.attributes) {
                userGroups = entry.attributes
                  .find(attr => attr.type === "memberOf")?.values || [];
                console.log("User Groups:", userGroups);
            }
        });

        res.on("error", (err) => {
          console.error("LDAP search encountered an error:", err);
          client.unbind();
          reject("LDAP search error");
        });

        res.on("end", (result) => {
          if (!userDN) {
            console.error("User not found in LDAP.");
            client.unbind();
            return reject("User not found");
          }

          // Authentication
          client.bind(userDN, password, (err) => {
            client.unbind();
            if (err) {
              console.error("LDAP user authentication failed:", err);
              return reject("LDAP authentication failed");
            }
            console.log("User authenticated successfully.");
            
            let role = "allievo";

            if (userGroups.some(group => group.includes("CN=Docenti"))) {
              role = "docente";
            }
            if (userGroups.some(group => group.includes("CN=Sistemisti"))) {
              role = "sistemista";
            }

            console.log("User Role:", role);
            //resolve({ username, role });
            resolve(true);
          });
        });
      });
    });
  });
}

module.exports = { authenticate };
