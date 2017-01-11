/*global logger*/
/*
    Default
    ========================

    @file      : ShowByCondition.js
    @version   : 1.3
    @author    : Remco Snijder
    @date      : Mon, 10 Jan, 2017
    @copyright : First Consulting
    @license   : Apache V2

    Documentation
    ========================
    v1.3 - Ivo Sturm - added toggling of visibility and storing of intitial style.display setting of parentNode, to be used when toggling to show again.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
	"dojo/NodeList-traverse",
    "mxui/widget/_WidgetBase",
	"mxui/dom",
	"dojo/_base/lang",
	"dojo/dom-style"
], function(declare, NodeList, _WidgetBase, dom, lang, domStyle) {
    "use strict";

    // Declare widget's prototype.
    return declare("ShowByCondition.widget.ShowByCondition", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
		microflowName: "",
		returnValue: "",

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
			// use this variable to store the initial setting of the parentNode.style.display. This setting will be used when toggling visibility
			this.parentDisplayArr = null;
			this.parentNode = null;

        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
			this.parentNode = this.domNode.parentNode;
			// store intial style.display setting of parentNode
			if (this.parentNode.currentStyle) {
				this.parentDisplayArr = this.parentNode.currentStyle.display;
			} else if (window.getComputedStyle) {
				this.parentDisplayArr = window.getComputedStyle(this.parentNode, null).getPropertyValue("display");
			}	
		
        },

		setParentDisplay : function(display) {
			//console.log(this.id + '_setParentDisplay triggered');
			if (display == this.returnValue){
				domStyle.set(this.domNode.parentNode, 'display', this.parentDisplayArr);
				//console.log(this.id + 'showing element');
			} else {
				domStyle.set(this.domNode.parentNode, 'display', 'none');
				//console.log(this.id + 'hiding element');
			}
		},

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
			this._contextObj = obj;
			this._resetSubscriptions();
			this._updateRendering();
            callback();
        },
		
		// Rerender the interface.
        _updateRendering: function () {
			if (this.microflowName != '') {
				mx.data.action({
					params: {
						applyto: "selection",
						actionname: this.microflowName,
						guids: [this._contextObj.getGuid()]
					},
					callback: dojo.hitch(this, function (result) {
						this.setParentDisplay(result);
					}),
					error: function(error) {
						alert(error.description);
					}
				}, this);
			}
        },
        // Reset subscriptions.
        _resetSubscriptions: function () {
            var _objectHandle = null;
            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle, i) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
            // When a mendix object exists create subscribtions. 
            if (this._contextObj) {
                _objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });
                this._handles = [_objectHandle];
            }
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {

            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },
    });
});

require(["ShowByCondition/widget/ShowByCondition"], function() {
    "use strict";
});
