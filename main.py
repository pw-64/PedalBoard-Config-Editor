from pedalboard import *
from pedalboard.io import AudioStream
from subprocess import run as shell_exec, PIPE
import threading, yaml

input_device = "BlackHole 2ch"

def run_sas_command(args: list): return shell_exec(['SwitchAudioSource'] + args, stdout=PIPE, universal_newlines=True).stdout.removesuffix("\n")

def new_stream(output_device_name: str, plugins: list):
    with AudioStream(input_device_name=input_device, output_device_name=output_device_name) as stream:
        stream.plugins = Pedalboard(plugins)
        while True: pass

def output(output_device_name: str, plugins: list): threading.Thread(target=new_stream, args=(output_device_name, plugins), daemon=True).start()

with open('config.yml', 'r') as file:
    try: data = yaml.safe_load(file)
    except yaml.YAMLError as err: quit(err)

exec_str = ''
for device in data:
    exec_str += f'output("{device}",['
    for modifier in data[device]:
        exec_str += modifier + '('
        for modifier_parameter in data[device][modifier]:
            # modifier_value = data[device][modifier][modifier_parameter]
            # if None == modifier_value: quit(f"Error: Empty value for {device} {modifier} {modifier_parameter}")
            # try: exec_str += f'{modifier_parameter}={modifier_value},'
            # except Exception as e: quit(e)
            exec_str += f'{modifier_parameter}={data[device][modifier][modifier_parameter]},'
        exec_str += '),'
    exec_str += ']);'
# print(exec_str)
exec(exec_str)

original_output = run_sas_command(['-c', '-t', 'output'])  # store which output is currently active
run_sas_command(['-s', input_device])  # set the system output to BlackHole input so that it is redirected into the program
input("Running. Press enter to stop ... ")
run_sas_command(['-s', original_output])  # revert the system output device