import ComplexNumber from './ComplexNumber';

export type IFourier = {
    r: number
    i: number
    frequency: number
    amplitude: number
    phase: number 
}

class Fourier {
    generateDiscreteFourierTransform(points: any[], skip: number): IFourier[] {
        let x = []
        let fourier = []
        const offset = { x: 0, y: 0 }

        for (let i = 0; i < points.length; i += skip) {
            x.push(new ComplexNumber(points[i].x - offset.x, points[i].y - offset.y))
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