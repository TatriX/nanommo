package main
import "math"

type Point struct {
	X, Y float64
}

func (p1 *Point) equals(p2 Point, epsilon float64) bool {
        if epsilon == 0 {
                epsilon = 1e-6;
        }
        return math.Abs(p1.X - p2.X) < epsilon && math.Abs(p1.Y - p2.Y) < epsilon;
}
