'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the SWAP ' + chalk.red('generator-bower-component') + ' generator!'
    ));

    this.log(
      chalk.blue('Please make sure to create a new empty github repository with a name: <component_NAME>.')
    );

    var prompts = [{
      type: 'input',
      name: 'componentName',
      message: 'What name for this new bower component ?',
      default: 'testgenerator'
    },{
      type: 'input',
      name: 'componentDescription',
      message: 'What description for this new bower component ?',
      default: 'A bower component that provides awesome feature'
    },{
      type: 'input',
      name: 'keywords',
      message: 'What keywords for this new bower component ? (comma separated list)',
      default: 'bower,component'
    },{
      type: 'input',
      name: 'authorName',
      message: 'What is your full name ?',
      default: null
    },{
      type: 'input',
      name: 'authorEmail',
      message: 'What is your email ?',
      default: null
    },{
      type: 'input',
      name: 'publicUpstreamNameSpace',
      message: 'What is your github username ?',
      default: null
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      done();
    }.bind(this));
  },

  writing: function () {
    var componentId = this.props.componentName.split('-'); componentId = componentId[componentId.length-1];
    var viewVars = {
      componentName: this.props.componentName,
      componentId: componentId,
      componentDescription: this.props.componentDescription,
      publicUpstreamNameSpace: this.props.publicUpstreamNameSpace,
      keywords: this.props.keywords.split(','),
      authorName: this.props.authorName,
      authorEmail: this.props.authorEmail,
      currentYear: new Date().getFullYear()
    };
    var templates = [
      ['_package.json','package.json'],
      ['bower.json','bower.json'],
      ['README.md','README.md'],
      ['component.js',this.props.componentName+'.js'],
      ['gruntfile.js','gruntfile.js'],
      ['LICENSE','LICENSE']
    ];
    var files = [
      ['_gitignore','.gitignore']
    ];
    for (var i = 0; i < templates.length; i++) {
      this.fs.copyTpl(
        this.templatePath(templates[i][0]),
        this.destinationPath(templates[i][1]),
        viewVars
      );
    }
    for (var i = 0; i < files.length; i++) {
      this.fs.copy(
        this.templatePath(files[i][0]),
        this.destinationPath(files[i][1])
      );
    }
  },

  install: function () {
    this.installDependencies();
  },

  end: function(){
    var that = this;
    that.spawnCommand('git', ['init'])
    .on('exit',function(){
      var gitrepo = 'git@github.com:'+that.props.publicUpstreamNameSpace+'/'+that.props.componentName+'.git';
      that.spawnCommand('git', ['remote', 'add', 'upstream', gitrepo])
      .on('exit',function(){
        that.spawnCommand('git', ['add', '.', '--all'])
        .on('exit',function(){
          that.spawnCommand('git', ['commit', '-m', '"initial commit from generator"'])
          .on('exit',function(){
            that.spawnCommand('git', ['tag', 'v0.1.0'])
            .on('exit',function(){
              that.spawnCommand('git', ['push', '-u', 'upstream', 'master'])
              .on('exit',function(){
                that.spawnCommand('git', ['push', 'upstream', '--tags'])
                .on('exit',function(){
                  var endMessage = 'Your new bower component was generated and a first release was pushed on github !';
                  endMessage += '\nYour can now develop your component and then, register it with `bower register '+that.props.componentName+'` !';
                  that.log(yosay(chalk.green(endMessage)));
                });
              });
            });
          });
        });
      });
    });
  }
});
