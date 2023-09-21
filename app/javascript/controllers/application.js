import { Application } from '@hotwired/stimulus';

Turbo.StreamActions.redirect = function () {
	Turbo.visit(this.target);
};

const application = Application.start();

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

export { application };
