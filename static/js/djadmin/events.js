define(['jquery','djadmin/io'], function($, socket) {

function Inputter(form_selector) {
    this.form_element = $(form_selector);
    this.latency = 200; // milliseconds
    this.timeout = null;
    this.getTextarea().on(
        'keyup change input propertychange focus blur',
        this.delay_evaluate.bind(this)
    );
    this.form_element.on("submit", this.on_submit.bind(this));
    socket.on("event_registered", this.on_register.bind(this));
    socket.on("event_error", this.on_error.bind(this));
}

Inputter.prototype.getTextarea = function() {
    return this.form_element.find('textarea');
}
Inputter.prototype.getMsgarea = function() {
    return this.form_element.find('.help-block');
}

Inputter.prototype.enable = function() {
    var form_group = this.form_element.children('.form-group');
    if (form_group.hasClass('has-success')) {
        return;
    }
    form_group.removeClass('has-error').addClass('has-success');
    this.form_element.children('fieldset').removeAttr('disabled');
    this.getMsgarea().text("That's valid. Good job.");
}
Inputter.prototype.disable = function(msg) {
    var form_group = this.form_element.children('.form-group');
    if (form_group.hasClass('has-error')) {
        return;
    }
    form_group.addClass('has-error').removeClass('has-success');
    this.form_element.children('fieldset').attr('disabled', true);
    this.getMsgarea().text(msg || "Must be valid JSON.");
}

Inputter.prototype.evaluate = function() {
    var value;
    value = this.getTextarea().val();
    try {
        JSON.parse(value);
        this.enable();
    } catch(e) {
        this.disable();
    }
}
Inputter.prototype.delay_evaluate = function() {
    if (this.timeout !== null) {
        clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(
        this.evaluate.bind(this),
        this.latency
    )
}

Inputter.prototype.on_submit = function(e) {
    var value;
    e.preventDefault();

    value = this.getTextarea().val();
    this.getMsgarea().text("Publishing event...");
    socket.emit("event", value);
}

Inputter.prototype.on_register = function(hash) {
    this.getMsgarea().text("Event "+hash+" published!");
}
Inputter.prototype.on_error = function(msg) {
    this.getMsgarea().text(msg);
    //this.disable()
}


return {
    "Inputter": Inputter
}

});