const ExamplesController = {
    New : (req, res) => {
        res.render("home", {isNew:true, sentMessages:req.session.sentMessages} )

    },

    Create: (req, res) => {
        if (req.session.sentMessages){
            req.session.sentMessages.push(req.body.input);
        } else {
            req.session.sentMessages = [req.body.input];
        };
        res.render("home", {hasCreatedSomething:true, sentMessages:req.session.sentMessages} )
    },

    Index: (req, res) => {
        res.render("home", { sentMessages:req.session.sentMessages} )
    }
};

module.exports = ExamplesController;
