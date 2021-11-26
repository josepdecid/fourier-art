import ComplexNumber from './ComplexNumber';
import { arrLinspace } from './misc';

export type IFourier = {
    r: number
    i: number
    frequency: number
    amplitude: number
    phase: number
}

class Fourier {
    generateDiscreteFourierTransform(points: any[], numCircles: number): IFourier[] {
        let x = []
        let fourier = []

        const linSpacedArray = arrLinspace(0, points.length - 1, numCircles);        
        for (let i = 0; i < linSpacedArray.length; ++i) {
            const idx = Math.round(linSpacedArray[i])
            x.push(new ComplexNumber(points[idx].x, points[idx].y))
        }

        fourier = this._discreteFourierTransform(x)
        fourier.sort((a, b) => b.amplitude - a.amplitude)

        return fourier
    }

    _discreteFourierTransform(x: ComplexNumber[]): IFourier[] {
        const result: IFourier[] = []
        const total = x.length

        for (let it = 0; it < total; ++it) {
            let sum = new ComplexNumber(0, 0)
            for (let n = 0; n < total; n++) {
                const theta = (2 * Math.PI * it * n) / total
                const sumAngle = new ComplexNumber(Math.cos(theta), -Math.sin(theta))
                sum = sum.add(x[n].multiply(sumAngle))
            }
            sum = sum.divide(new ComplexNumber(total, 0))

            const frequency = it
            const amplitude = sum.amplitude()
            const phase = sum.phase()
            const { r, i } = sum

            result[it] = { r, i, frequency, amplitude, phase }
        }

        return result
    }
}

export default Fourier