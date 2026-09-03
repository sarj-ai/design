export default {
  fetch(request: Request): Response {
    const destination = new URL(request.url);
    destination.hostname = 'design.sarj.ai';
    return Response.redirect(destination, 308);
  },
};
