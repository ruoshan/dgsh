var htmlDocument = document;

/* The URL used to periodically update the displayed popup */
var url;

/* The event that caused the popup to be displayed */
var popup_event = null;

/* The interval update used to update the popup */
var popup_update;

function get_popup_info_div(id) {
	return document.getElementById(id);
}

function set_child_color(node, child_kind, color) {
	var child = node.getElementsByTagName(child_kind)[0];

	if (color == null) {
		child.setAttribute('stroke', child.oldStroke);
		child.setAttribute('fill', child.oldFill);
	} else {
		child.oldStroke = child.getAttribute('stroke')
		child.oldFill = child.getAttribute('fill')
		child.setAttribute('stroke', color);
		if (child_kind != "path") {
			child.setAttribute('fill', color);
		}
	}
}

/* Update the popup box with the JSON result of the active URL */
update_content = function() {
	$.getJSON(
                url,
                {},
                function(json) {
			$('#bytes').text(json.nbytes);
			$('#lines').text(json.nlines);
			$('#bps').text((json.nbytes / json.rtime).toFixed(0));
			$('#lps').text((json.nlines / json.rtime).toFixed(0));
			$('#record').text(json.data);

			var label = get_popup_info_div("popup");
			label.style.visibility='visible';
			label.style.top=popup_event.pageY + 'px';
			label.style.left=(popup_event.pageX+30) + 'px';
                }
	);
}

over_edge_handler = function(e) {
	url = 'http://localhost:HTTP_PORT/mon-' + this.id;
	popup_event = e;
	update_content();
	popup_update = setInterval(update_content, 500);

	set_child_color(this, "path", "blue");
	set_child_color(this, "polygon", "blue");
}

out_edge_handler = function() {
	var label = get_popup_info_div("popup");
	label.style.visibility='hidden';
	clearInterval(popup_update);

	set_child_color(this, "path", null);
	set_child_color(this, "polygon", null);
}

over_node_handler = function(e) {
	// Remove leading "store:" prefix
	url = 'http://localhost:HTTP_PORT/mon-nps-' + this.id.substring(6);
	popup_event = e;
	update_content();
	popup_update = setInterval(update_content, 500);

	console.log(this);
	console.log(this.tagName);

	if (this.getElementsByTagName("ellipse")[0] != null) {
		set_child_color(this, "ellipse", "blue");
	} else {
		set_child_color(this, "polygon", "blue");
	}
}

out_node_handler = function(e) {
	var label = get_popup_info_div("popup");
	label.style.visibility='hidden';
	clearInterval(popup_update);

	if (label) {
		label.style.visibility='hidden';
	}

	if (this.getElementsByTagName("ellipse")[0] != null) {
		set_child_color(this, "ellipse", null);
	} else {
		set_child_color(this, "polygon", null);
	}
}

$(document).ready(function() {
	var svg = document.getElementById('thesvg').getSVGDocument();
	if (!svg) {
		svg = document.getElementById('thesvg');
	}
	var all = svg.getElementsByTagName("g");

	for (var i=0, max=all.length; i < max; i++) {
		var element = all[i];
		className = element.className.baseVal;
		if (className.match(/edge.*/)) {
			element.onmouseover = over_edge_handler;
			element.onmouseout = out_edge_handler;
		} else if (className.match(/node.*/) && element.id.match(/store:/)) {
			element.onmouseover = over_node_handler;
			element.onmouseout = out_node_handler;
		}

		/* Clear the title, which appears as a useless tooltip */
		var title = element.getElementsByTagName('title')[0];
		title.innerHTML = '';
	}
});