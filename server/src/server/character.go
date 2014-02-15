package main

import (
	"math"
)

const (
	CHAR_DEFAULT_SPEED = 100
)

type Character struct {
	Pos, Dst Point   //Текущее положение и точка назначения
	Angle    float64 //Угол поворота (на будущее)
	Speed    uint    //Максимальная скорость
	Name     string
}

func (c *Character) update(k float64) {
	if c.Pos.equals(c.Dst, float64(c.Speed)*k) {
		c.Pos = c.Dst
		return
	}
	lenX := c.Dst.X - c.Pos.X
	lenY := c.Dst.Y - c.Pos.Y
	c.Angle = math.Atan2(lenY, lenX)
	dx := math.Cos(c.Angle) * float64(c.Speed) * k
	dy := math.Sin(c.Angle) * float64(c.Speed) * k
	c.Pos.X += dx
	c.Pos.Y += dy
}

func NewCharacter() Character {
	c := Character{Speed: CHAR_DEFAULT_SPEED}
	c.Pos = Point{100, 100}
	c.Dst = c.Pos
	return c
}
