
const interface_list = document.getElementById("interface-list");

function zypper_list_repos() {
    // delete the old content
    interface_list.innerHTML = "";
    
    cockpit.spawn(["/usr/sbin/wicked", "show-xml", "all"])
        .then(zypper_list_success)
        .catch(zypper_list_fail);
}

function zypper_list_success(data) {
    let xmlDoc;

    let header = "<root xmlns:ipv4=\"http://example.com/ipv4\" xmlns:ipv6=\"http://example.com/ipv6\">\n";
    let footer = "</root>\n";
    data = header + data + footer;

    if (window.DOMParser) {
        console.log("MV: domparser");
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, "text/xml");
    }
    else // MSIE
    {
        console.log("MV: msie");
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(data); // was: txt
    }

    let repos = xmlDoc.getElementsByTagName("object");
    for (let i = 0; i < repos.length; i++) {
        let repo = repos[i];

        let tr_e = document.createElement("tr");
        tr_e.classList.add("listing-ct-item");

        let name_e = document.createElement("th");
        name_e.append(document.createTextNode(repo.getAttribute("path")));

        let ip_e = document.createElement("th");
        get_ip(repo, ip_e);

        let sending_e = document.createElement("th");
        let receiving_e = document.createElement("th");

        tr_e.appendChild(name_e);
        tr_e.appendChild(ip_e);
        tr_e.appendChild(sending_e);
        tr_e.appendChild(receiving_e);

        interface_list.appendChild(tr_e);
    };
}

function get_ip(object_e, th_e) {
    let local_es = object_e.getElementsByTagName("local");

    for (let i = 0; i < local_es.length; i++) {
        let local_e = local_es[i];
        let local_s = local_e.textContent;
        let p_e = document.createElement("p");
        p_e.append(document.createTextNode(local_s));
        th_e.appendChild(p_e);
    }
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
