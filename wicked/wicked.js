
const interface_list = document.getElementById("interface-list");

function wicked_list_ifaces() {
    // delete the old content
    interface_list.innerHTML = "";
    
    cockpit.spawn(["/usr/sbin/wicked", "show-xml", "all"])
        .then(wicked_list_success)
        .catch(wicked_list_fail);
}

/* create a DOM element */
function el(name) {
    return document.createElement(name);
}


function wicked_list_success(data) {
    let xmlDoc;

    let header = "<root xmlns:ipv4=\"http://example.com/ipv4\" xmlns:ipv6=\"http://example.com/ipv6\">\n";
    let footer = "</root>\n";
    data = header + data + footer;

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");

    let ifaces = xmlDoc.getElementsByTagName("object");
    for (let i = 0; i < ifaces.length; i++) {
        let iface = ifaces[i];

        let tr_e = el("tr");
        tr_e.classList.add("listing-ct-item");

        let name_e = el("th");
        name_e.append(document.createTextNode(iface.getAttribute("path")));

        let ip_e = el("th");
        get_ip(iface, ip_e);

        let sending_e = el("th");
        let receiving_e = el("th");

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
        let p_e = el("p");
        p_e.append(document.createTextNode(local_s));
        th_e.appendChild(p_e);
    }
}

function wicked_list_fail(message) {
    console.log("wicked failure: ", message);
}

// init the content
wicked_list_ifaces();

// Send a 'init' message.  This tells integration tests that we are ready to go
cockpit.transport.wait(function () { });
