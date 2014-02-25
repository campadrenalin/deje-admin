package main

// Main HTTP server with Martini
import (
	"github.com/campadrenalin/go-deje"
	"github.com/codegangsta/martini"
	"github.com/martini-contrib/encoder"
	"github.com/martini-contrib/render"
	"net/http"
)

type Page struct {
	Nav  string
	Data interface{}
}

type Handler func(render.Render)

func make_handler(tmpl string) Handler {
	return func(r render.Render) {
		r.HTML(200, tmpl, Page{tmpl, nil})
	}
}

// Middleware

func EncoderMiddleware(c martini.Context, w http.ResponseWriter) {
	c.MapTo(encoder.JsonEncoder{}, (*encoder.Encoder)(nil))
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
}

func do_open(req *http.Request, c *deje.DEJEController, r render.Render) {
	location, err := get_location(req)
	if err != nil {
		r.HTML(500, "error", Page{Data: err})
		return
	}

	doc := c.GetDocument(*location)
	r.HTML(200, "console", Page{Data: doc})
}

// Events graph
func do_events(req *http.Request, c *deje.DEJEController, r render.Render) {
	location, err := get_location(req)
	if err != nil {
		r.HTML(500, "error", Page{Data: err})
		return
	}

	doc := c.GetDocument(*location)
	r.HTML(200, "events", doc, render.HTMLOptions{Layout: ""})
}

func do_notfound(r render.Render) {
	r.HTML(404, "404", Page{})
}

func run_http(controller *deje.DEJEController) {
	m := martini.Classic()
	m.Map(controller)
	m.Use(martini.Static("static"))
	m.Use(render.Renderer(render.Options{
		Layout: "layout",
	}))

	m.Get("/", make_handler("root"))
	m.Get("/about", make_handler("about"))
	m.Get("/help", make_handler("help"))
	m.Get("/open", do_open)
	m.Get("/events", do_events)
	m.Get("/api/events", EncoderMiddleware, do_events_json)
	m.NotFound(do_notfound)

	http.ListenAndServe(":3000", m)
}
