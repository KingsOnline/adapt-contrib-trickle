define([
    'coreJS/adapt', 
], function(Adapt) {

    var TrickleBodyResizeHandler = _.extend({

        isStepLocking: false,

        stepView: null,

        initialize: function() {
            this.listenToOnce(Adapt, "app:dataReady", this.onAppDataReady);
        },

        onAppDataReady: function() {
            this.debounceOnResize();
            this.setupEventListeners();
        },

        debounceOnResize: function() {
            this.onResize = _.debounce(_.bind(this.onResize, this), 10);
        },

        setupEventListeners: function() {
            this.listenTo(Adapt, {
                "trickle:steplock": this.onStepLock,
                "trickle:resize": this.onTrickleResize,
                "trickle:stepunlock": this.onStepUnlock,
                "trickle:kill": this.onKill,
                "trickle:finished": this.onFinished,
                "remove": this.onRemove
            });
        },

        onStepLock: function(view) {
            this.isStepLocking = true;
            this.stepView = view;
            $(window).on("resize", this.onResize);
            $("#wrapper").on("resize", this.onResize);
            _.defer(function() {
                Adapt.trigger("trickle:resize");
            });
        },

        onResize: function() {
            if (!this.isStepLocking) return;
            Adapt.trigger("trickle:resize");
        },

        onTrickleResize: function() {
            if (!this.isStepLocking) return;
            var offset = this.stepView.$el.offset();
            var height = this.stepView.$el.height();

            var bottom = offset['top'] + height;

            $("body").css("height", bottom );
        },

        onStepUnlock: function(view) {
            this.isStepLocking = false;
            this.stepView = null;
            $(window).off("resize", this.onResize);
            $("#wrapper").off("resize", this.onResize);
        },

        onKill: function() {
            this.onFinished();
            this.onStepUnlock();
        },

        onFinished: function() {
             $("body").css("height", "" );
        },

        onRemove: function() {
            this.onStepUnlock();
            this.stepView = null;
        }

    }, Backbone.Events);

    TrickleBodyResizeHandler.initialize();

    return TrickleBodyResizeHandler;

});
