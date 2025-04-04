const ldap = require("ldapjs");

function authenticate(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: process.env.LDAP_SERVER_URL });

    client.bind(
      process.env.LDAP_BIND_DN,
      process.env.LDAP_BIND_PASSWORD,
      (err) => {
        if (err) {
          console.error("LDAP bind failed:", err);
          client.unbind();
          return reject({ code: "LDAP_ERROR", message: "LDAP bind failed" });
        }

        const searchOptions = {
          filter: `(sAMAccountName=${username})`,
          scope: "sub",
          attributes: ["dn", "cn", "memberOf"],
        };

        client.search(process.env.BASE_DN, searchOptions, (err, res) => {
          if (err) {
            client.unbind();
            return reject({
              code: "LDAP_ERROR",
              message: "LDAP search failed",
            });
          }

          let userDN = null;
          let userGroups = [];

          res.on("searchEntry", (entry) => {
            if (!entry) return;

            userDN = entry.dn.toString();

            if (entry.attributes) {
              userGroups =
                entry.attributes.find((attr) => attr.type === "memberOf")
                  ?.values || [];
            }
          });

          res.on("error", (err) => {
            client.unbind();
            reject({ code: "LDAP_ERROR", message: "LDAP search error" });
          });

          res.on("end", () => {
            if (!userDN) {
              client.unbind();
              return reject({
                code: "INVALID_CREDENTIALS",
                message: "User not found",
              });
            }

            client.bind(userDN, password, (err) => {
              client.unbind();
              if (err) {
                return reject({
                  code: "INVALID_CREDENTIALS",
                  message: "Invalid credentials",
                });
              }

              let role = "allievo";
              
              if (userDN.includes("OU=Docenti")) {
                  role = "docente";
              } 
              if (userDN.includes("OU=Admins")) {
                  role = "sistemista";
              }

              resolve({ username, role });
            });
          });
        });
      }
    );
  });
}


function fetchLdapUsers(ouList) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: process.env.LDAP_SERVER_URL });

    client.bind(
      process.env.LDAP_BIND_DN,
      process.env.LDAP_BIND_PASSWORD,
      (err) => {
        if (err) {
          console.error("LDAP bind failed:", err);
          client.unbind();
          return reject({ code: "LDAP_ERROR", message: "LDAP bind failed" });
        }

        const searchOptions = {
          scope: "sub",
          filter: "(OU=SAMT)",
          attributes: ["dn", "cn", "sAMAccountName", "mail"],
        };

        client.search(process.env.BASE_DN, searchOptions, (err, res) => {
          if (err) {
            console.error("LDAP search failed:", err);
            client.unbind();
            return reject({
              code: "LDAP_ERROR",
              message: "LDAP search failed",
            });
          }

          const users = [];

          res.on("searchEntry", (entry) => {
            if (!entry) return;

            let username = entry.attributes.find((attr) => attr.type === "sAMAccountName")?.values;
            let mail = entry.attributes.find((attr) => attr.type === "mail")?.values || null;
            let userDN = entry.dn;
            
            if (Array.isArray(userDN)) {
              userDN = userDN.join(',');
            } else if (typeof userDN !== "string") {
              userDN = String(userDN);
            }
            
            let isInOu = ouList.some((ou) => userDN.includes(ou));

            if (isInOu) {
              users.push({
                username: username,
                email: mail || "",
              });
            }
          });

          res.on("end", () => {
            client.unbind();
            resolve(users);
          });

          res.on("error", (error) => {
            console.error("LDAP search error:", error);
            client.unbind();
            reject({ code: "LDAP_ERROR", message: "LDAP search error" });
          });
        });
      }
    );
  });
}

module.exports = { authenticate, fetchLdapUsers };
