
const repo_list = document.getElementById("repo-list");

function zypper_list_repos() {
    // delete the old content
    repo_list.innerHTML = "";
    
    cockpit.spawn(["zypper", "--xmlout", "lr"])
        .then(zypper_list_success)
        .catch(zypper_list_fail);
}

function zypper_list_success(data) {
    let xmlDoc;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, "text/xml");
    }
    else // MSIE
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(txt);
    }

    let repos = xmlDoc.getElementsByTagName("repo");
    for (let i = 0; i < repos.length; i++) {
        let repo = repos[i];

        let tr = document.createElement("tr");
        tr.classList.add("listing-ct-item");

        let enabled = document.createElement("td");
        enabled.append(create_checkbox(repo.getAttribute("enabled")));
        enabled.addEventListener("click", function () {
            zypper_enable_repo(repo.getAttribute("enabled") == "0", repo.getAttribute("alias"));
        });

        let autorefresh = document.createElement("td");
        autorefresh.append(create_checkbox(repo.getAttribute("autorefresh")));
        autorefresh.addEventListener("click", function () {
            zypper_refresh_repo(repo.getAttribute("autorefresh") == "0", repo.getAttribute("alias"));
        });

        let name = document.createElement("th");
        name.append(document.createTextNode(repo.getAttribute("name")));

        let url = document.createElement("td");
        url.append(document.createTextNode(repo.getElementsByTagName("url")[0].textContent));

        tr.appendChild(enabled);
        tr.appendChild(autorefresh);
        tr.appendChild(name);
        tr.appendChild(url);

        repo_list.appendChild(tr);
    };
}

function create_checkbox(checked) {
    let checkbox = document.createElement("i");
    checkbox.classList.add("fa");

    if (checked === "1")
        checkbox.classList.add("fa-check-square-o");
    else
        checkbox.classList.add("fa-square-o");

    return checkbox;
}

function zypper_list_fail(message) {
    console.log("zypper failure: ", message);
}

function zypper_enable_repo(enable, alias) {
    let option = enable ? "--enable" : "--disable";
    zypper_modify_repo(option, alias);
}

function zypper_refresh_repo(autorefresh, alias) {
    let option = autorefresh ? "--refresh" : "--no-refresh";
    zypper_modify_repo(option, alias);
}

function zypper_modify_repo(option, alias)
{
    cockpit.spawn(["zypper", "modifyrepo", option, alias], { superuser: true })
        .then(zypper_list_repos)
        .catch(zypper_list_fail);
}

// init the content
zypper_list_repos();

// Send a 'init' message.  This tells integration tests that we are ready to go
cockpit.transport.wait(function () { });
