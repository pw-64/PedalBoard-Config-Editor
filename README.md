# PedalBoard-Config-Editor
This project is a web-based editor for the PedalBoard audio pipeline.

## Information
PedalBoard, made by Spotify's Audio Intelligence Lab, is a python package to, among other uses, create a real-time / live audio pipeline. It can be used to add reverb to headphones to give the illusion of a concert, or lowpass for speakers so that people around you don't have to hear the lyrics but you can still feel the bass.

You can combine and fine-tune many different modifiers and have multiple outputs, each with their own configuration.

Best of all, all of the configuration is stored in human-readable YAML. This means that you can easily share your setups with others, and can easily make quick changes. You can also copy-paste sections onto other outputs.

Alongside the python script to run PedalBoard from a config file, this repo also includes a web-based GUI editor for the configuration file, to make the setup process even easier, and code-newbie friendly. You don't need any programming skills; just configure it how you like in the GUI, copy-paste the output into the config file, assign your input and start!

## Setup
1. Download or clone this repo
2. Install the dependencies:
```bash
python3 -m venv env
source env/bin/activate
pip install pedalboard
brew install switchaudio-osx
```

## How To Use
1. Use the GUI to configure your pipeline
  - Add outputs
  - Add modifiers to the outputs, if wanted
  - Configure the modifier options, or use the pre-filled defaults
2. Copy-paste the yaml output into config.yml
3. Set the input_device for the script in main.py
4. Run `python3 main.py` to start
