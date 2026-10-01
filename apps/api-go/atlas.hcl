env "local" {
  src = "file://db/schema/schema.sql"
  dev = "docker://postgres/16/dev?search_path=public"

  migration {
    dir    = "file://db/migrations"
    format = golang-migrate
  }
}
