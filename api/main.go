package main

import (
	"Api-learning/config"
)

func main() {
	// router := http.NewServeMux()
	// router.HandleFunc("/item/{id}", func(w http.ResponseWriter, r *http.Request) {
	// 	id := r.PathValue("id")
	// 	w.Write([]byte("Se recibio la request del item " + id))
	// })

	// server := http.Server{
	// 	Addr:    ":8080",
	// 	Handler: router,
	// }
	// log.Println("Prendiendo server en el puerto 8080")
	// server.ListenAndServe()
	config.ConnectDB(config.NewDBConfig())
}
