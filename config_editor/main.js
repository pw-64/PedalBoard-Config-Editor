let data = {};
let add_modifier_button;
let config_yml;

const modifier_options = {
    Bitcrush: {bit_depth: {type: "number", step: 1, default: 8, min: 0, max: 32}},
    Chorus: {
        rate_hz: {type: "number", step: 1, default: 1, min: 0, max: 100},
        depth: {type: "number", step: 0.1, default: 0.25, min: 0, max: 1},
        centre_delay_ms: {type: "number", step: 1, default: 7},
        feedback: {type: "number", step: 1, default: 0, min: 0, max: 1},
        mix: {type: "number", step: 0.1, default: 0.5, min: 0, max: 1}
    },
    Clipping: {threshold_db: {type: "number", step: 0.5, default: -6}},
    Compressor: {
        threshold_db: {type: "number", step: 1, default: 0},
        ratio: {type: "number", step: 0.1, default: 1, min: 0, max: 1},
        attack_ms: {type: "number", step: 1, default: 1},
        release_ms: {type: "number", step: 1, default: 100}
    },
    Convolution: {
        impulse_response_filename: {type: "string", default: "./"},
        mix: {type: "number", step: 0.1, default: 1, min: 0, max: 1}
    },
    Delay: {
        delay_seconds: {type: "number", step: 0.1, default: 0.5},
        feedback: {type: "number", step: 1, default: 0, min: 0, max: 1},
        mix: {type: "number", step: 0.1, default: 1, min: 0, max: 1}
    },
    Distortion: {drive_db: {type: "number", step: 1, default: 25}},
    Gain: {gain_db: {type: "number", step: 1, default: 1}},
    HighShelfFilter: {
        cutoff_frequency_hz: {type: "number", step: 1, default: 440},
        gain_db: {type: "number", step: 1, default: 0},
        q: {type: "number", step: 0.05, default: 0.7071067690849304, min: 0, max: 1}
    },
    HighpassFilter: {cutoff_frequency_hz: {type: "number", step: 1, default: 50}},
    Limiter: {
        threshold_db: {type: "number", step: 1, default: -10},
        release_ms: {type: "number", step: 1, default: 100}
    },
    LowShelfFilter: {
        cutoff_frequency_hz: {type: "number", step: 1, default: 440},
        gain_db: {type: "number", step: 1, default: 0},
        q: {type: "number", step: 1, default: 0.7071067690849304, min: 0, max: 1}
    },
    LowpassFilter: {cutoff_frequency_hz: {type: "number", step: 1, default: 50}},
    Phaser: {
        rate_hz: {type: "number", step: 1, default: 1},
        depth: {type: "number", step: 0.1, default: 0.5, min: 0, max: 1},
        centre_frequency_hz: {type: "number", step: 1, default: 1300},
        feedback: {type: "number", step: 0.1, default: 0, min: 0, max: 1},
        mix: {type: "number", step: 0.1, default: 0.5}
    },
    PitchShift: {semitones: {type: "number", step: 1, default: 0}},
    Resample: {
        target_sample_rate: {type: "number", step: 1, default: 8000},
        quality: {
            type: "dropdown",
            default: "WindowedSinc",
            options: [
                "ZeroOrderHold",
                "Linear",
                "CatmullRom",
                "Lagrange",
                "WindowedSinc",
            ]
        }
    },
    Reverb: {
        room_size: {type: "number", step: 0.1, default: 0.5},
        damping: {type: "number", step: 1, default: 0.5},
        wet_level: {type: "number", step: 1, default: 0.33},
        dry_level: {type: "number", step: 1, default: 0.4},
        width: {type: "number", step: 1, default: 1.0},
        freeze_mode: {type: "number", step: 1, default: 0.0}
    }
};

$(document).ready(() => {
    config_yml = $("#config_yml");
    add_modifier_button = $("#add_modifier");
});

function CopyConfig() {
    config_yml.select();
    navigator.clipboard.writeText(config_yml.val())
        .then(() => {
            config_yml.blur();
            $("#config_copy").addClass("green");
            setTimeout(() => {$("#config_copy").removeClass("green");}, 1000);
        });
}

function GenerateUUID() {
    const generate = function () {return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);};
    return generate() + "-" + generate() + "-" + generate() + "-" + generate();
}

function yamlAutoResize() {
    const lines = config_yml.val().split("\n");
    let max_line_length = 0;
    lines.forEach(line => {max_line_length = Math.max(max_line_length, line.length);});
    config_yml[0].setAttribute("cols", max_line_length);
    config_yml[0].setAttribute("rows", lines.length);
}

function ParseYAML() {
    data = {};
    const lines = config_yml.val().split("\n");
    let output, modifier;
    lines.forEach( line => { if (line !== "") {
        if (line[0] === "#") {return;} // skip comments
        const indentation = line.search(/\S|$/); // count leading whitespace
        // add different levels to the dataset based on that indentation
        switch (indentation) {
            case 0:
                output = line.replace(":", "");
                // if (data[output] !== undefined) {console.error(`Error: Duplicate Output '${output}'`); return;}
                data[output] = {};
                break;
            case 2:
                modifier = line.replace(":", "").substring(2);
                // if (data[output][modifier] !== undefined) {console.error(`Error: Duplicate Modifier '${output}' -> '${modifier}'`); return;}
                data[output][modifier] = {};
                break;
            case 4:
                const parameter = line.split(":")[0].substring(4);
                const parameter_value = line.split(":")[1].substring(1);
                // if (data[output][modifier][parameter] !== undefined) {console.error(`Error: Duplicate Modifier Parameter '${output}' -> '${modifier}' -> '${parameter}'`); return;}
                data[output][modifier][parameter] = parameter_value;
                break;
        }
    }});
}

function GenerateYAML() {
    let yaml = "";
    for (let output in data) {
        yaml += output + ":\n";
        for (let modifier in data[output]) {
            yaml += "  " + modifier + ":\n";
            for (let parameter in data[output][modifier]) {
                yaml += "    " + parameter + ": " + data[output][modifier][parameter] + "\n";
            }
        }
    }
    config_yml.val(yaml);
    yamlAutoResize();
}

function Generate() {
    ParseYAML();
    GenerateOutputs();
    $("#modifiers")[0].replaceChildren();
    $("#modifier_params")[0].replaceChildren();
}

function DeleteButton(container, delete_function) {
    const delete_button = document.createElement("button");
    const delete_image = document.createElement("img");
    container.appendChild(delete_button);
    delete_button.appendChild(delete_image);
    delete_button.onclick = delete_function;
    delete_image.src = "images/delete.svg";
}

function GenerateOutputs() {
    let outputs = [];
    for (const output in data) {
        const container = document.createElement("div");
        outputs.push(container);
        const element = document.createElement("input");
        container.appendChild(element);
        const id = GenerateUUID();
        element.id = id;
        element.value = output;
        element.setAttribute("previous_name", output);
        container.onmousedown = () => {OutputSelected(id, output);};
        element.onchange = () => {
            const new_name = element.value; // the new value just entered
            const old_name = element.getAttribute("previous_name"); // the value before it was changed, stored in the element as an attribute
            element.setAttribute("previous_name", new_name); // update the attribute with the new name for the next change
            data[new_name] = data[old_name]; // copy the data for the old name to the new name
            delete data[old_name]; // delete the data for the old name
            GenerateYAML(); // update the yaml
            GenerateOutputs(); // update the buttons
        }
        DeleteButton(container, () => {
            delete data[output];
            GenerateOutputs();
            GenerateYAML();
        });
    }
    $("#outputs")[0].replaceChildren(...outputs);
    add_modifier_button.css("visibility", "hidden");
    GenerateModifiers(null);
    GenerateModifierParameters(null, null);
}

function AddOutput() {
    config_yml[0].value += `Output #${Math.floor(Math.random() * 10 ** 4)}\n`;
    yamlAutoResize();
    Generate();
}

function OutputSelected(id, output) {
    $("#outputs > div").removeClass("active");
    $("div:has(#" + id + ")").addClass("active");
    add_modifier_button.css("visibility", "visible");
    add_modifier_button[0].onclick = () => {AddModifier(output);};
    GenerateModifiers(output);
}

function GenerateModifiers(output) {
    let modifiers = [];
    for (const modifier in data[output]) {
        const container = document.createElement("div");
        modifiers.push(container);
        const select = document.createElement("select");
        container.appendChild(select);
        for (let modifier_option in modifier_options) {
            const option = document.createElement("option");
            select.appendChild(option);
            option.value = modifier_option;
            option.textContent = modifier_option;
        }
        const id = GenerateUUID();
        select.id = id;
        select.value = modifier;
        select.setAttribute("previous", modifier);
        container.onmousedown = () => {ModifierSelected(id, output, modifier);};
        select.onchange = () => {
            const previous_value = select.getAttribute("previous");
            const new_value = select.value;
            data[output][new_value] = /*data[output][previous_value]*/ {};
            delete data[output][previous_value];
            select.setAttribute("previous", new_value);
            GenerateYAML(); // update the yaml
            GenerateModifiers(output); // update the buttons
            GenerateModifierParameters(null, null); // clear the params
        }
        DeleteButton(container, () => {
            delete data[output][modifier];
            GenerateModifiers(output);
            GenerateYAML();
            $("#modifier_params")[0].replaceChildren();
        });
    }
    $("#modifiers")[0].replaceChildren(...modifiers);
    $("#reset_all_params").css("visibility", "hidden");
}

function AddModifier(output) {
    // data[output][`Modifier #${Math.floor(Math.random() * 1000)}`] = {}; // allow multiple modifiers to be created at once
    data[output]["Modifier"] = {}; // only allow one new modifier at a time
    GenerateModifiers(output);
    GenerateYAML();
}

function ModifierSelected(id, output, modifier) {
    $("#modifiers > div").removeClass("active");
    $("div:has(#" + id + ")").addClass("active");
    GenerateModifierParameters(output, modifier);
    $("#reset_all_params").css("visibility", "visible");
}

function GenerateModifierParameters(output, modifier) {
    let parameters = [];
    for (const parameter in modifier_options[modifier]) {
        const container = document.createElement("div");
        parameters.push(container);
        const label = document.createElement("p");
        container.appendChild(label);
        label.textContent = parameter;
        const param_config = modifier_options[modifier][parameter];

        let input;
        const Update = () => {
            data[output][modifier][parameter] = input.value;
            GenerateYAML();
        };

        switch (param_config.type) {
            case "string":
                input = document.createElement("input");
                input.oninput = Update;
                break;
            case "number":
                input = document.createElement("input");
                input.type = "number";
                input.step = param_config.step;
                if (param_config.min !== undefined && param_config.max !== undefined) {
                    input.type = "range";
                    input.min = param_config.min;
                    input.max = param_config.max;
                    const slider_text = document.createElement("span");
                    container.appendChild(slider_text);
                    slider_text.textContent = input.value;
                    input.oninput = () => {
                        slider_text.textContent = input.value;
                        Update();
                    };
                }
                break;
            case "dropdown":
                input = document.createElement("select");
                param_config.options.forEach(option => {
                    let option_element = document.createElement("option");
                    input.appendChild(option_element);
                    option_element.value = option.toString();
                    option_element.textContent = option.toString();
                });
                input.oninput = Update;
                break;
        }

        input.value = data[output][modifier][parameter] ?? param_config.default;
        data[output][modifier][parameter] = input.value;
        container.appendChild(input);
        const reset_button = document.createElement("button");
        container.appendChild(reset_button);
        const reset_image = document.createElement("img");
        reset_button.appendChild(reset_image);
        reset_button.onclick = () => {
            input.value = param_config.default;
            Update();
        };
        reset_image.src = "images/reset.svg";
    }
    $("#modifier_params")[0].replaceChildren(...parameters);
    GenerateYAML();
}

function ResetAllModifierParameters() {$("#modifier_params button").click();}