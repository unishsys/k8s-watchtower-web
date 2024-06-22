.PHONY:


update:
	rm -rfv ../kube-watchtower/handlers/spa && \
	quasar build && \
	cp -rfv dist/spa ../kube-watchtower/handlers/
