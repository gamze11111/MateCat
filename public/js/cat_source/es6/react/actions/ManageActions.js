var AppDispatcher = require('../dispatcher/AppDispatcher');
var ManageConstants = require('../constants/ManageConstants');


var ManageActions = {
    /********* SEGMENTS *********/

    /** Render the list of projects
     * @param projects
     */
    renderProjects: function (projects, hideSpinner) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.RENDER_PROJECTS,
            project: projects,
            hideSpinner: hideSpinner,
        });
    },
    /** Render the more projects
     * @param projects
     */
    renderMoreProjects: function (projects) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.RENDER_MORE_PROJECTS,
            project: projects,
        });
    },
    /** Open the translate page with the options tab open
     * @param job
     * @param prName
     */
    openJobSettings: function (job, prName) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.OPEN_JOB_SETTINGS,
            job: job,
            prName: prName
        });
    },

    /** Open the translate page with the TM tab open
     * @param job
     * @param prName
     */
    openJobTMPanel: function (job, prName) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.OPEN_JOB_TM_PANEL,
            job: job,
            prName: prName
        });
    },

    removeProject: function (project) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.REMOVE_PROJECT,
            project: project
        });
    },

    removeJob: function (project, job) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.REMOVE_JOB,
            project: project,
            job: job
        });
    },

    changeJobPassword: function (project, job, password, oldPassword) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.CHANGE_JOB_PASS,
            project: project,
            job: job,
            password: password,
            oldPassword: oldPassword
        });
    },

    noMoreProjects: function () {
        AppDispatcher.dispatch({
            actionType: ManageConstants.NO_MORE_PROJECTS,
        });
    },

    showReloadSpinner: function () {
        AppDispatcher.dispatch({
            actionType: ManageConstants.SHOW_RELOAD_SPINNER,
        });
    }


};

module.exports = ManageActions;