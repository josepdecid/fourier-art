import { fourierX, graphPoints, path } from './main'

import Fourier from './utils/Fourier'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

export const params = {
    'Time Scale': 1,
    'Number of Circles': 10
}

export function setupGUI() {
    const gui = new GUI()

    gui.add(params, 'Time Scale', 0, 5, 0.1).listen()
    gui.add(params, 'Number of Circles', 1, 50, 1).onChange(value => {
        fourierX = new Fourier().generateDiscreteFourierTransform(path, value)
    })
}
