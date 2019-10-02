# jenkins-ansi-color-js

Pure Javascript implementation of ansi-color plugin for Jenkins.
Great replacement of class ansi-color plugin for jenkins with no server usage.

Using great JS Ansi color library: http://github.com/drudru/ansi_up


## Usage

There are 3 approaches:

1. Copy js folder to Jenkins theme location on filesystem.
1. Add content of main js file to your Jenkins theme js file.
1. Jenkins > Manage Jenkins > Configure System > Theme > Add > JavaScript URL
    * `https://TheJaredWilcurt.github.io/jenkins-ansi-color-js/index.js`
    * If you do not see a "Themes" section go to:
        * Jenkins > Manage Jenkins > Manage Plugins > Available > Simple Theme Plugin > Install


### I looking for someone able to create classic Jenkins plugin from this
